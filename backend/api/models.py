from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        # El campo username del modelo AbstractUser todavía existe.
        # Lo poblamos con el email para evitar problemas de unicidad si no se proporciona.
        username = extra_fields.pop('username', email) 
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('rol', 'admin') # Asegurar que el superusuario tenga rol admin

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        # El campo username se manejará dentro de create_user
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    ROLES = [
        ('admin', 'Administrador'),
        ('profesor', 'Profesor'),
        ('padre', 'Padre'),
        ('alumno', 'Alumno'),
    ]
    rol = models.CharField(max_length=10, choices=ROLES, default='admin')
    
    email = models.EmailField(_('email address'), unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # username ya no es requerido aquí explícitamente

    objects = CustomUserManager() # Asignar el manager personalizado

    def __str__(self):
        return self.email
