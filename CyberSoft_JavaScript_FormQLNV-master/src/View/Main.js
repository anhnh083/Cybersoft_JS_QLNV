import { NhanVien } from "../Model/listNhanVien.js";
import { qlnvServices } from "../Controller/Services.js";
import { Validation } from "../Controller/Validation.js";

let idNhanVien;

const VND = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
});

let content = '';
let chucvu = '';
const renderTable = (arrNhanVien) => {
    const listNhanVien = document.getElementById('listNhanVien');
    arrNhanVien.forEach((item) => {
        if (parseInt(item.chucVu) === 1) chucvu = 'Giám Đốc';
        if (parseInt(item.chucVu) === 2) chucvu = 'Trưởng Phòng';
        if (parseInt(item.chucVu) === 3) chucvu = 'Nhân Viên';

        content += `
            <tr class="hover:bg-[#dcd8dd] transition duration-300">
                    <td class="p-2 border">${item.taiKhoan}</td>
                    <td class="p-2 border">${item.hoTen}</td>
                    <td class="p-2 border">${item.email}</td>
                    <td class="p-2 border text-center">${item.ngayLam}</td>
                    <td class="p-2 border text-center">${VND.format(item.luongCoBan).replace('₫', '')}</td>
                    <td class="p-2 border text-center">${chucvu}</td>
                    <td class="p-2 border text-center">${item.gioLam}</td>
                    <td class="p-2 border text-center">${VND.format(item.tongLuong).replace('₫', '')}</td>
                    <td class="p-2 border text-center">${item.loaiNV}</td>
                    <td class="py-2 border text-center flex flex-wrap gap-2 justify-center">
                        <button type="button" onclick="getNhanVien('${item.id}')" class="btnSua bg-[#8B625A] opacity-100 hover:opacity-90 transition duration-500 px-5 py-2 rounded text-white">Sửa</button>
                        <button type="button" onclick="deleteNhanVien('${item.id}')" class="btnXoa bg-[#AE8665] opacity-100 hover:opacity-90 transition duration-500 px-5 py-2 rounded text-white">Xóa</button>
                    </td>
                </tr>
        `;
    });
    listNhanVien.innerHTML = content;
    content = '';
}


const calTongLuong = (luongcoban, chucvu) => {
    if (parseInt(chucvu) === 1) return parseInt(luongcoban) * 3;
    if (parseInt(chucvu) === 2) return parseInt(luongcoban) * 2;
    if (parseInt(chucvu) === 3) return parseInt(luongcoban) * 1.5;
}


const calLoaiNV = (giolam) => {
    if (parseInt(giolam) < 160) return "Trung Bình";
    if (parseInt(giolam) >= 160 && parseInt(giolam) < 176) return "Khá";
    if (parseInt(giolam) >= 176 && parseInt(giolam) < 192) return "Giỏi";
    if (parseInt(giolam) >= 192) return "Xuất Sắc";
}


const addNewNhanVien = () => {
    const modal = document.querySelectorAll('#myForm input, #myForm select');
    let nhanvien = {};
    modal.forEach(element => {
        const { id, value } = element;
        nhanvien[id] = value;
    });

    
    const sumLuong = calTongLuong(nhanvien.luongCoBan, nhanvien.chucVu);
    const loaiNV = calLoaiNV(nhanvien.gioLam);
    return new NhanVien(nhanvien.taiKhoan, nhanvien.hoTen, nhanvien.email, nhanvien.matKhau, nhanvien.ngayLam, nhanvien.luongCoBan, nhanvien.chucVu, nhanvien.gioLam, sumLuong, loaiNV);
}


const checkValidation = (nhanvien) => {
    const validation = new Validation();
    let isValid = true;

    isValid &= validation.required(nhanvien.chucVu, '* Chưa chọn chức vụ!', 'checkChucVu');
    isValid &= validation.required(nhanvien.ngayLam, '* Chưa nhập ngày vào làm!', 'checkNgayLam');

    isValid &= validation.checkTaiKhoan(nhanvien.taiKhoan.length, '* Tài khoản tối đa 4 - 6 ký tự!', 'checkTaiKhoan');


    isValid &= validation.regexText(nhanvien.hoTen, '* Họ tên phải là chữ!', 'checkHoTen');


    isValid &= validation.regexPassword(nhanvien.matKhau, '* Mật Khẩu từ 6-10 ký tự (chứa ít nhất 1 ký tự số, 1 ký tự in hoa, 1 ký tự đặc biệt)!', 'checkMatKhau');

 
    isValid &= validation.regexEmail(nhanvien.email, '* Email không hợp lệ!', 'checkEmail');


    isValid &= validation.checkLuongCoBan(parseInt(nhanvien.luongCoBan), '* Lương từ 1.000.000 - 20.000.000!', 'checkLuongCoBan');


    isValid &= validation.checkGioLam(parseInt(nhanvien.gioLam), '* Giờ làm từ 80 - 200 giờ!', 'checkGioLam');



    return isValid;
}


const form = document.getElementById('myForm');
document.getElementById('myForm').onsubmit = async (e) => {
    try {
        e.preventDefault();
        if (form.getAttribute('action') === "ThemMoi") {
            const nhanvien = addNewNhanVien();
            if (checkValidation(nhanvien)) {
                await qlnvServices.addNhanVien(nhanvien);
                document.getElementById('overlay').style.display = 'none';
            }
        }
        if (form.getAttribute('action') === "CapNhat") {
            const nhanvien = addNewNhanVien();
            if (checkValidation(nhanvien)) {
                await qlnvServices.editNhanVien(idNhanVien, nhanvien);
                document.getElementById('overlay').style.display = 'none';
            }
        }

        getListNV();
    } catch (error) {
        console.log('Lỗi request!', error);
    }
}


const renderModal = (NhanVien) => {
    const { taiKhoan, hoTen, matKhau, email, ngayLam, luongCoBan, chucVu, gioLam } = NhanVien;
    const modal = document.querySelectorAll('#myForm input, #myForm select');

    modal.forEach((element, index) => {
        switch (index) {
            case 0: element.value = taiKhoan; break;
            case 1: element.value = hoTen; break;
            case 2: element.value = email; break;
            case 3: element.value = matKhau; break;
            case 4: element.value = ngayLam; break;
            case 5: element.value = luongCoBan; break;

            case 6:
                const option = element.querySelectorAll('option');
                if (parseInt(chucVu) === 1) {
                    option[1].selected = true;
                    break;
                }
                if (parseInt(chucVu) === 2) {
                    option[2].selected = true;
                    break;
                }
                if (parseInt(chucVu) === 3) {
                    option[3].selected = true;
                    break;
                }
                option[0].selected = true;
                break;

            case 7: element.value = gioLam; break;
        }
    });


    const messageError = document.querySelectorAll('#myForm span');
    messageError.forEach(element => {
        element.style.display = 'none';
    });
}



window.getNhanVien = async (id) => {
    try {
        idNhanVien = id;
        const result = await qlnvServices.getNhanVienByID(id);
        renderModal(result.data);
        overlay.style.display = 'block';
        myForm.setAttribute('action', 'CapNhat');
    } catch (error) {
        console.log('Lỗi lấy thông tin nhân viên ', error);
    }

}

window.deleteNhanVien = async (id) => {
    try {
        await qlnvServices.deleteNhanVien(id);
        getListNV();
    } catch (error) {
        console.log('Lỗi xóa nhân viên ', error);
    }
}

const getListNV = async () => {
    try {
        const result = await qlnvServices.getListNhanVien();
        renderTable(result.data);
    } catch (error) {
        console.log('Lỗi lấy danh sách nhân viên', error);
    }
}
getListNV()



const overlay = document.getElementById('overlay');
const myForm = document.getElementById('myForm');

document.getElementById('btnThem').onclick = () => {
    overlay.style.display = 'block';
    myForm.setAttribute('action', 'ThemMoi');

    const modal = document.querySelectorAll('#myForm input', '#myForm select');
    modal.forEach((element, index) => {
        element.value = '';
    });

    const messageError = document.querySelectorAll('#myForm span');
    messageError.forEach(element => {
        element.style.display = 'none';
    });
}


document.getElementById('btnClose').onclick = () => {
    overlay.style.display = 'none';
    myForm.setAttribute('action', '');
}


const select = document.getElementById('loaiNV');
select.addEventListener('change', async () => {
    try {
        const loai = parseInt(select.value);
        let result;

        if (loai === 0) {
            return getListNV();
        }
        if (loai === 1) {
            result = await qlnvServices.getNhanVienByLoaiNV("Xuất Sắc");
        }
        if (loai === 2) {
            result = await qlnvServices.getNhanVienByLoaiNV("Giỏi");
        }
        if (loai === 3) {
            result = await qlnvServices.getNhanVienByLoaiNV("Khá");
        }
        if (loai === 4) {
            result = await qlnvServices.getNhanVienByLoaiNV("Trung Bình");
        }
        if (result.status === 200) renderTable(result.data);
    } catch (error) {
        console.log("Lỗi lấy danh sách nhân viên theo loại", error);
        const listNhanVien = document.getElementById('listNhanVien');
        listNhanVien.innerHTML = "Không có dữ liệu!";
    }
})


const pass = document.getElementById('showPassword');
pass.addEventListener('click', ()=>{
    const txtPass = document.getElementById('matKhau');
    if(pass.classList.contains('fa-eye')){
        pass.classList.replace('fa-eye','fa-eye-slash');
        txtPass.setAttribute('type','text');
        return;
    }
    if(pass.classList.contains('fa-eye-slash')){
        pass.classList.replace('fa-eye-slash','fa-eye');
        txtPass.setAttribute('type','password');
        return;
    }
})