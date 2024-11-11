import {json} from "@sveltejs/kit";
import {capitalizeWords} from "$lib/js/common/util.common.js";
import {sendMail} from "$lib/js/server/util.mail.server.js";
import {createUser} from "$lib/js/server/repositories/repository.sqlite.users.server.js";
import {BASE_URL} from "$lib/js/server/constants.server.js";

export async function PUT({request, locals}) {
    const body = await request.json(),
        password = generateRandomPassword(),
        fullNameCapitalized = capitalizeWords(body.fullName)

    let user
    if (locals.user.role === 0) {
        const {error, user: _user} = await createUser(
            fullNameCapitalized,
            body.email,
            password,
            body.role,
            body.unitId
        )

        if (error)
            return json({error}, {status: 409})

        user = _user
    } else {
        const {error, user: _user} = await createUser(
            fullNameCapitalized,
            body.email,
            password,
            2,
            locals.user.authorizedUnit.id
        )

        if (error)
            return json({error}, {status: 409})

        user = _user
    }

    const error = await sendMail(
        body.email,
        'Hesabınız Oluşturuldu',
        `
            <p>Merhaba, ${fullNameCapitalized}.</p>
            
            <br>
            
            <p>Personel Takip Sistemi platformunda hesabınız oluşturdu.</p>
            
            <br>
            
            <p><em>E-posta adresi: ${body.email}</em></p>
            <p><em>Şifreniz:     : ${password}</em></p>
            
            <br>
            
            <p><strong>Platforma giriş yaptıktan sonra şifrenizi değiştirmeniz önem arz etmektedir.</strong></p>
            <p><a href="${BASE_URL}/giriş-yap">Platforma giriş yapmak için tıklayın.</a></p>
            
            <br>
            
            <p>Personel Takip Sistemi, Adıyaman Üniversitesi</p>
        `
    )

    if (error)
        return json({error}, {status: 500})

    return json({user})
}

function generateRandomPassword() {
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz',
        upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        digits = '0123456789',
        allChars = lowerCaseChars + upperCaseChars + digits

    let password =
        lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)] +
        upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)] +
        digits[Math.floor(Math.random() * digits.length)]

    for (let i = 3; i < Math.floor(Math.random() * 9) + 8; i++)
        password += allChars[Math.floor(Math.random() * allChars.length)]

    password = password.split('').sort(() => Math.random() - 0.5).join('')

    return password
}