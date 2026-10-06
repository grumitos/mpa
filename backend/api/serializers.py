from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
        # Los privilegios no se asignan desde la API: cualquier usuario autenticado puede
        # escribir aquí, así que solo el admin de Django puede convertir a alguien en staff.
        read_only_fields = (
            'is_superuser', 'is_staff', 'groups', 'user_permissions', 'last_login', 'date_joined',
        )
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        return Usuario.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        # Sin esto, una contraseña nueva se guardaría en claro en vez de con hash.
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        return user
