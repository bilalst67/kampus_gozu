import Swal from 'sweetalert2';

export const showToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#adabc7',
        color: '#161616',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon, 
        title: title
    });
};

export const showConfirm = async (title, text = "Bu işlem geri alınamaz!") => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#14387f', 
        cancelButtonColor: '#d33',
        confirmButtonText: 'Evet, Devam Et',
        cancelButtonText: 'Vazgeç',
        background: '#f8f9fa',
        color: '#333',
        borderRadius: '16px'
    });

    return result.isConfirmed;
};