from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario

@admin.register(Usuario)
class UserAdmin(BaseUserAdmin):
    # Campos que se mostrarán al crear un nuevo usuario
    # Como USERNAME_FIELD es 'email', 'email' es ahora el campo principal.
    # 'username' sigue siendo requerido por REQUIRED_FIELDS en el modelo.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password', 'rol'), # 'email' es el nuevo username, 'username' es el campo legacy
        }),
    )

    # Campos que se mostrarán al editar un usuario existente
    # Aseguramos que 'email' esté presente y sea el principal
    fieldsets = (
        (None, {'fields': ('email', 'password')}), # 'email' en lugar de 'username'
        ('Información personal', {'fields': ('username', 'first_name', 'last_name')}), # 'username' movido aquí
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
        ('Rol', {'fields': ('rol',)}),
    )

    # Campos que se mostrarán en la lista de usuarios
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'rol') # 'email' primero
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'rol')
    search_fields = ('email', 'username', 'first_name', 'last_name') # Buscar por 'email' y 'username'
    ordering = ('email',)

    # Necesario para que el formulario de creación use add_fieldsets
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)

# Si habías registrado Usuario de forma simple antes, coméntalo o elimínalo:
# admin.site.register(Usuario) # Ya no es necesario si usas @admin.register(Usuario) arriba
