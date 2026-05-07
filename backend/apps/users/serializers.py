from rest_framework import serializers, validators
from .models import User
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group

class CustomUserSerializer(serializers.ModelSerializer):

    groups = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields =("id", "email", "username","groups")
    
    def get_groups(self, obj):
        return [group.name for group in obj.groups.all()]

class RegisterUserSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(
        validators=[validators.UniqueValidator(queryset=User.objects.all())]
    )
    username = serializers.CharField(
        validators=[validators.UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ("email", "username", "password")
        extra_kwargs = {"password":{"write_only":True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        group = Group.objects.get(name="user")
        user.groups.add(group)

        return user
        
      
class LoginUserSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active and (user is not None):
            return user
        raise serializers.ValidationError("Incorrect credentials!")
        
        
    
    

""" class UserSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True}  # password can be sent to API, but not returned
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)

        password = validated_data.get("password", None)
        if password:
            instance.set_password(password)

        instance.save()
        return instance """