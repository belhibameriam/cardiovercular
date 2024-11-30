from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import UserAccount


class UserAccountCreationForm(UserCreationForm):

    class Meta:
        model = UserAccount
        fields = ('first_name', 'last_name', 'email', 'date_of_birth', 'phone', 'grade', 'groups')


class UserAccountChangeForm(UserChangeForm):

    class Meta:
        model = UserAccount
        fields = ('first_name', 'last_name', 'email', 'date_of_birth', 'phone', 'grade', 'groups')