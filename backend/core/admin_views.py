from django.contrib import admin
from django.contrib.auth.models import Group, Permission, User
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import user_passes_test, login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.utils.translation import gettext as _
from django.contrib import messages

# Get all installed models and their permissions
def get_installed_models():
    from django.apps import apps
    from django.contrib.auth.management import create_permissions
    
    # Make sure all permissions are created
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, verbosity=0)
    
    # Get all content types
    content_types = ContentType.objects.all()
    
    # Group by app_label
    apps_dict = {}
    for ct in content_types:
        if ct.app_label not in apps_dict:
            apps_dict[ct.app_label] = []
        
        # Get all permissions for this model
        perms = Permission.objects.filter(content_type=ct).order_by('codename')
        if perms.exists():
            apps_dict[ct.app_label].append({
                'name': ct.model_class()._meta.verbose_name_plural.title() if ct.model_class() else ct.model,
                'model': ct.model,
                'app_label': ct.app_label,
                'permissions': perms
            })
    
    return apps_dict

def get_permission_data(permission_holder):
    """Get all permissions organized by app and model for a user or group"""
    from django.contrib.auth.models import User, Group
    
    apps_data = get_installed_models()
    result = []
    
    # Get all permissions for the permission_holder
    if isinstance(permission_holder, User):
        user_permissions = set(permission_holder.get_all_permissions())
        group_permissions = set()
        for group in permission_holder.groups.all():
            group_perms = group.permissions.values_list('content_type__app_label', 'codename')
            group_permissions.update(f"{app_label}.{codename}" for app_label, codename in group_perms)
        all_permissions = user_permissions.union(group_permissions)
    elif isinstance(permission_holder, Group):
        group_perms = permission_holder.permissions.values_list('content_type__app_label', 'codename')
        all_permissions = {f"{app_label}.{codename}" for app_label, codename in group_perms}
    else:
        all_permissions = set()
    
    for app_label, models in apps_data.items():
        app_data = {
            'app_label': app_label,
            'app_name': app_label.title(),
            'models': []
        }
        
        for model in models:
            model_perms = {
                'name': model['name'],
                'model': model['model'],
                'permissions': {}
            }
            
            for perm in model['permissions']:
                permission_name = perm.codename.split('_', 1)[0]  # 'add', 'change', 'view', 'delete'
                perm_str = f"{perm.content_type.app_label}.{perm.codename}"
                has_perm = perm_str in all_permissions
                model_perms['permissions'][permission_name] = {
                    'id': perm.id,
                    'name': perm.name,
                    'has_perm': has_perm,
                    'codename': perm.codename
                }
            
            if model_perms['permissions']:  # Only add if there are permissions
                model_perms['model_permission'] = f"{model['app_label']}.view_{model['model']}"
                app_data['models'].append(model_perms)
        
        if app_data['models']:  # Only add if there are models with permissions
            result.append(app_data)
    
    return result

@staff_member_required
def user_permissions(request, user_id=None):
    """View for managing user permissions"""
    if not request.user.has_perm('auth.change_user'):
        return HttpResponseForbidden(_("You don't have permission to edit user permissions."))
    
    # Get all users ordered by username
    users = User.objects.all().order_by('username')
    selected_user = None
    
    if not users.exists():
        messages.warning(request, _("No staff users found."))
    else:
        # If user_id is provided, get that user
        if user_id:
            selected_user = get_object_or_404(User, id=user_id)
        # Otherwise, if there are users, select the first one
        elif users.exists():
            selected_user = users.first()
            
        # For POST requests, we need to ensure selected_user is set
        if request.method == 'POST' and not selected_user and users.exists():
            selected_user = users.first()
    
    if request.method == 'POST':
        if not selected_user:
            return JsonResponse({'success': False, 'error': _('No user selected')})
            
        try:
            # Get all permissions for the selected user
            user_permissions = request.POST.getlist('permissions[]')
            
            # Update user permissions
            selected_user.user_permissions.clear()
            if user_permissions:
                permissions = Permission.objects.filter(id__in=user_permissions)
                selected_user.user_permissions.set(permissions)
            
            messages.success(request, _('Permissions updated successfully.'))
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True})
                
        except Exception as e:
            messages.error(request, _('Error updating permissions: %s') % str(e))
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': str(e)})
    
    context = {
        'users': users,
        'selected_user': selected_user,
        'title': _('User Permissions'),
    }
    
    if selected_user:
        context['permission_data'] = get_permission_data(selected_user)
    
    return render(request, 'admin/permissions/user_permissions.html', context)

@staff_member_required
def group_permissions(request, group_id=None):
    """View for managing group permissions"""
    if not request.user.has_perm('auth.change_group'):
        return HttpResponseForbidden(_("You don't have permission to edit group permissions."))
    
    groups = Group.objects.all().order_by('name')
    selected_group = None
    
    if group_id:
        selected_group = get_object_or_404(Group, id=group_id)
    elif groups.exists():
        selected_group = groups.first()
    
    if request.method == 'POST':
        if not selected_group:
            return JsonResponse({'success': False, 'error': _('No group selected')})
            
        try:
            # Get all permissions for the selected group
            group_permissions = request.POST.getlist('permissions[]')
            
            # Update group permissions
            selected_group.permissions.clear()
            if group_permissions:
                permissions = Permission.objects.filter(id__in=group_permissions)
                selected_group.permissions.set(permissions)
            
            messages.success(request, _('Group permissions updated successfully.'))
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True})
                
        except Exception as e:
            messages.error(request, _('Error updating group permissions: %s') % str(e))
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': str(e)})
    
    context = {
        'groups': groups,
        'selected_group': selected_group,
        'title': _('Group Permissions'),
    }
    
    if selected_group:
        context['permission_data'] = get_permission_data(selected_group)
    
    return render(request, 'admin/permissions/group_permissions.html', context)
