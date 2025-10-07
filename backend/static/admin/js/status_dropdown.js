document.addEventListener('DOMContentLoaded', function() {
    // إضافة event listener لجميع dropdowns
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('status-dropdown')) {
            const dropdown = e.target;
            const profileId = dropdown.getAttribute('data-profile-id');
            const newStatus = dropdown.value;
            
            // إظهار loading indicator
            const originalValue = dropdown.value;
            dropdown.disabled = true;
            dropdown.style.opacity = '0.6';
            
            // إرسال طلب AJAX
            const formData = new FormData();
            formData.append('profile_id', profileId);
            formData.append('status', newStatus);
            formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
            
            fetch('/admin/auth/user/update-status/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // تحديث لون النص حسب الحالة الجديدة
                    const statusColors = {
                        'Student': '#28a745',
                        'Instructor': '#007bff',
                        'Admin': '#dc3545'
                    };
                    
                    dropdown.style.color = statusColors[newStatus] || '#6c757d';
                    
                    // إظهار رسالة نجاح
                    showMessage(data.message, 'success');
                    
                    // تحديث النص المعروض
                    const statusLabels = {
                        'Student': 'Student',
                        'Instructor': 'Instructor',
                        'Admin': 'Admin'
                    };
                    
                    // تحديث النص المعروض في الخيار المحدد
                    const selectedOption = dropdown.options[dropdown.selectedIndex];
                    selectedOption.text = statusLabels[newStatus] || newStatus;
                } else {
                    // إرجاع القيمة الأصلية في حالة الخطأ
                    dropdown.value = originalValue;
                    showMessage('خطأ في تحديث الحالة: ' + data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                dropdown.value = originalValue;
                showMessage('خطأ في الاتصال بالخادم', 'error');
            })
            .finally(() => {
                // إعادة تفعيل dropdown
                dropdown.disabled = false;
                dropdown.style.opacity = '1';
            });
        }
    });
});

// دالة للحصول على CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// دالة لإظهار الرسائل
function showMessage(message, type) {
    // إنشاء عنصر الرسالة
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
    `;
    messageDiv.textContent = message;
    
    // إضافة الرسالة إلى الصفحة
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة بعد 3 ثوان
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}
