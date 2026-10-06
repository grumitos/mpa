from django.test import override_settings

# Con el hasher por defecto (PBKDF2) cada usuario creado tarda cientos de milisegundos.
fast_hashers = override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
