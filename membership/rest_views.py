import re
import logging
logger = logging.getLogger("membership.rest_views")

from django.utils.html import escape

from djangorestframework.views import View, ListModelView, InstanceModelView
from djangorestframework.resources import ModelResource
from djangorestframework.response import Response, ErrorResponse
from djangorestframework.renderers import JSONRenderer
from djangorestframework import status
from djangorestframework.permissions import *

from models import Membership
from services.models import Alias
from services.views import VALID_USERNAME_RE

# A rather generic view to use (or inherit) to specify a queryset for a view
class SpecializedQuerySetListModelView(ListModelView):
    @classmethod
    def as_view(cls, **initkwargs):
        view = super(SpecializedQuerySetListModelView, cls).as_view(**initkwargs)
        view.cls_instance = cls(**initkwargs)
        view.queryset = initkwargs['queryset']
        return view

# Membership resource
class MembershipResource(ModelResource):
    model = Membership

    fields = ('type', 'status', 'created', 'approved', 'last_changed',
              'public_memberlist', 'municipality', 'nationality', 'person',
              'billing_contact', 'tech_contact', 'organization', 'extra_info')

    ordering = ('-created')

# Membership JSON escaping for user-input fields
class EscapedMembershipResourceJSONRenderer(JSONRenderer):
    def render(self, obj=None, media_type=None):
        if obj is None:
            return ''

        def escape_attrs(o, attrs):
            if o is None:
                return

            for attr in attrs:
                if o.has_key(attr):
                    o[attr] = escape(o[attr])
                    # print o, attr

        membership_attrs = ['municipality', 'nationality', 'extra_info']
        contact_attrs = ['first_name', 'given_names', 'last_name',
                         'organization_name', 'street_address', 'postal_code',
                         'post_office', 'country', 'phone', 'sms', 'email',
                         'homepage']

        escape_attrs(obj, membership_attrs)
        escape_attrs(obj.get('person'), contact_attrs)
        escape_attrs(obj.get('billing_contact'), contact_attrs)
        escape_attrs(obj.get('tech_contact'), contact_attrs)
        escape_attrs(obj.get('organization'), contact_attrs)

        return super(EscapedMembershipResourceJSONRenderer, self).render(obj=obj,
                                                                         media_type=media_type)

class EscapedMembershipResourceJSONView(View):
    renderers = (EscapedMembershipResourceJSONRenderer,)

_403_FORBIDDEN_RESPONSE = ErrorResponse(
    status.HTTP_403_FORBIDDEN,
    {'detail': 'You do not have permission to access this resource. ' +
      'You may need to login or otherwise authenticate the request.'})

class MembershipResourcePermission(IsAuthenticated):
    def check_permission(self, user):
        super(MembershipResourcePermission, self).check_permission(user)
        if not user.has_perm('membership.read_members'):
            raise _403_FORBIDDEN_RESPONSE

        if self.view.method not in ('GET', 'HEAD') and \
            not user.has_perm('membership.manage_members'):
            raise _403_FORBIDDEN_RESPONSE

class EscapedMembershipInstanceView(InstanceModelView, EscapedMembershipResourceJSONView):
    permissions = (MembershipResourcePermission,)


# Alias views
class AvailableAliasView(View):
    permissions = (PerUserThrottling, FullAnonAccess,)
    throttle = '12/min'

    def get(self, request, name):
        if Alias.objects.filter(name__iexact=name).count() > 0:
            logger.debug("Failed alias availability check: %s" % name)
            return Response(status.HTTP_404_NOT_FOUND)

        logger.debug("Successful alias availability check: %s" % name)
        return Response(status.HTTP_200_OK, {'name': name, 'available': True})

class ValidAliasView(View):
    permissions = (PerUserThrottling, FullAnonAccess,)
    throttle = '12/min'

    def get(self, request, name):
        if re.match(VALID_USERNAME_RE, name) == None:
            logger.debug("Failed alias validity check: %s" % name)
            return Response(status.HTTP_404_NOT_FOUND)
        logger.debug("Successful alias validity check: %s" % name)
        return Response(status.HTTP_200_OK,
                        {'name': name, 'valid': True})

class IdShoppingCartView(View):
    permissions = (MembershipResourcePermission,)

    def _ensure_cart(self, request):
        if not request.session.has_key(self.__class__.__name__):
            request.session[self.__class__.__name__] = []

    def get(self, request):
        self._ensure_cart(request)
        return request.session[self.__class__.__name__]

    def post(self, request):
        # print request.session
        self._ensure_cart(request)
        id = int(request.POST['id'])

        cart = request.session[self.__class__.__name__]
        cart.append(id)
        request.session[self.__class__.__name__] = cart

        logger.debug("Added %i to %s cart" % (id, self.__class__.__name__))
        return Response(status.HTTP_200_OK, id)

class PreapprovalCart(IdShoppingCartView):
    pass

class ApprovalCart(IdShoppingCartView):
    pass
