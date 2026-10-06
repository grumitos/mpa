from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Las relaciones many-to-many no se pueden pasar al constructor del modelo.
        groups = validated_data.pop('groups', [])
        permissions = validated_data.pop('user_permissions', [])
        user = Usuario.objects.create_user(password=password, **validated_data)
        user.groups.set(groups)
        user.user_permissions.set(permissions)
        return user
