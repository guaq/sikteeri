from djangorestframework.resources import ModelResource

from membership.models import Membership


class MembershipResource(ModelResource):
    model = Membership
    fields = ('type', 'status', 'created', 'approved', 'last_changed',
              'public_memberlist', 'municipality', 'nationality', 'person',
              'billing_contact', 'tech_contact', 'organization', 'extra_info')
    ordering = ('-created')
