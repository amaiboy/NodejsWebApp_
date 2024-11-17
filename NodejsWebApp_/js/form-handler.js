'use strict';

function validateForm() {
    var form = document.getElementById('feedbackForm');
    var companyName = form.elements.companyName.value;
    var contactName = form.elements.contactName.value;
    var email = form.elements.email.value;
    var phone = form.elements.phone.value;

    clearErrors();

    var isValid = true;

    if (!companyName.trim()) {
        showError('companyName', 'Назва компанії є обов\'язковою');
        isValid = false;
    }

    if (!contactName.trim()) {
        showError('contactName', 'Ім\'я контактної особи є обов\'язковим');
        isValid = false;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email)) {
        showError('email', 'Введіть коректну електронну пошту');
        isValid = false;
    }

    var phonePattern = /^\+?\d{10,}$/;
    if (!phone.trim() || !phonePattern.test(phone.replace(/[\s-]/g, ''))) {
        showError('phone', 'Введіть коректний номер телефону');
        isValid = false;
    }

    return isValid;
}

function showError(fieldName, message) {
    var errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearErrors() {
    var errorElements = document.getElementsByClassName('error-message');
    for (var i = 0; i < errorElements.length; i++) {
        errorElements[i].style.display = 'none';
    }
}

function handleSubmit(event) {
    event.preventDefault();

    if (validateForm()) {
        document.getElementById('feedbackForm').submit();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});