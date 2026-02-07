from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        from django.conf import settings
        from django.apps import apps
        from django.db.utils import OperationalError, ProgrammingError

        try:
            User = apps.get_model(settings.AUTH_USER_MODEL)  # npr. api.User
            username = "admin"

            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    email="admin@test.com",
                    password="admin123"
                )
        except (OperationalError, ProgrammingError):
            return
