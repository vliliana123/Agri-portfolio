from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from .models import Users


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication:
    - Citește access_token din cookie httpOnly (preferat).
    - Fallback la header `Authorization: Bearer ...` (pentru mobile app eventual).
    - Folosește modelul Users custom (nu auth_user-ul Django).
    """

    def authenticate(self, request):
        # 1) Încearcă din cookie
        raw_token = request.COOKIES.get('access_token')

        # 2) Fallback la header Authorization
        if raw_token is None:
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None

        # 3) Validează și returnează user
        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            return None

        return self.get_user(validated_token), validated_token

    def get_user(self, validated_token):
        """Override pentru a folosi modelul Users custom."""
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Token contains no user_id')
            user = Users.objects.get(id=user_id)
            return user
        except Users.DoesNotExist:
            raise AuthenticationFailed('User not found')
        except Exception as e:
            raise AuthenticationFailed(f'Error: {str(e)}')
