import datetime
from haystack import indexes
from haystack import site
from membership.models import Membership

class MembershipIndex(indexes.SearchIndex):
    text = indexes.CharField(document=True, use_template=True, template_name="membership/templates/search/membership_text.txt")
    
    def get_queryset(self):
        """Used when the entire index for model is updated."""
        return Membership.objects.filter(last_changed__lte=datetime.datetime.now())

site.register(Membership, MembershipIndex)

