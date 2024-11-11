export const BASE_URL = 'https://personeltakip.adiyaman.edu.tr'

export const
    ROUTES_SHOULD_NOT_BE_AUTHENTICATED =
        new Map([
            ['/giriş-yap', 1],
            ["/api/user/sign-in", 1],
            ["/api/user/send-recover-password-link", 1],
            ["/api/user/recover-password", 1],
            ["/şifremi-kurtar", 1],
        ]),
    ROUTES_MASTER_ADMINS =
        new Map([
            ['/birimler', 1],
            ["/api/unit/add-unit", 1],
            ["/api/unit/edit-unit", 1],
            ["/api/unit/remove-unit", 1],
            ["/api/unit/get-units", 1],
            ["/api/unit/get-all-units", 1],
        ]),
    ROUTES_ADMINS =
        new Map([
            ['/personel-çalışmaları', 1],
            ["/kullanıcılar", 1],
            ["/api/user/check-existence", 1],
            ["/api/user/add-user", 1],
            ["/api/user/remove-user", 1],
            ["/api/user/get-users", 1],
            ["/api/work/get-staff-works", 1],
        ])