# utils.py
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
import random

def generate_and_send_2fa(user):
    code = f"{random.randint(100000, 999999)}"  # 6-digit code
    cache_key = f"2fa_{user.id}"
    cache.set(cache_key, code, timeout=300)  # 5 minutes expiration
    send_mail(
        subject="Your 2FA Code",
        message=f"Your 2FA verification code is: {code}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )