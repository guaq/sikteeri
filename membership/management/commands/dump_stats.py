# -*- encoding: utf-8 -*-
from __future__ import print_function
from datetime import datetime
from optparse import make_option, OptionParser

from django.db.models import Q
from django.core.management.base import BaseCommand
from django.conf import settings

from membership.models import *

class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--after', action='store', dest='after', default=None,
                    type='string',
                    help='Only consider objects created after given date'),
    )

    def handle(self, after=None, *args, **options):
        if after is not None:
            after = datetime.strptime(after, '%Y-%m-%d')
        else:
            after = datetime(2000, 1, 1)

        b = Bill.objects.filter(created__gte=after)
        stats = {
            'billingcycles.count': BillingCycle.objects.filter(start__gte=after).count,
            'payments.count': Payment.objects.filter(payment_day__gte=after).count,
            'bills.count': b.count,
            'bills.unpaid.count': b.filter(billingcycle__is_paid=False).count,
            'bills.paid.count': b.filter(billingcycle__is_paid=True).count,

            'reminders.count': b.filter(reminder_count__gt=0).count,
            'reminders.email.count': b.filter(reminder_count__gt=0).filter(type='E').count,
            'reminders.paper.count': b.filter(reminder_count__gt=0).filter(type='P').count,
            'reminders.sms.count': b.filter(reminder_count__gt=0).filter(type='S').count,

            'membership.count': Membership.objects.filter(created__gte=after).count,
            'contact.count': Contact.objects.filter(created__gte=after).count,
        }

        for name, callback in sorted(stats.items(), cmp=lambda x, y: x[0] < y[0]):
            print(u"{0}\t{1}".format(name, callback()))
