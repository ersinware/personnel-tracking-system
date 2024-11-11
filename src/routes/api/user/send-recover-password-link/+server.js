import {json} from "@sveltejs/kit";
import {randomBytes} from 'crypto';
import {capitalizeWords} from "$lib/js/common/util.common.js";
import {sendMail} from "$lib/js/server/util.mail.server.js";
import {checkFullNameAndEmailMatch} from "$lib/js/server/repositories/repository.sqlite.users.server.js";
import {
    createToken,
    removeToken
} from "$lib/js/server/repositories/repository.sqlite.recover.password.tokens.server.js";
import {BASE_URL} from "$lib/js/server/constants.server.js";

export async function PUT({request}) {
    const {fullName, email} = await request.json(),
        _fullName = capitalizeWords(fullName),
        {error, match, id: userId} = await checkFullNameAndEmailMatch(_fullName, email)

    if (error)
        return json({error}, {status: 404})

    if (!match)
        return json({error: 'Adınızı veya e-posta adresinizi yanlış girdiniz.'}, {status: 404})

    const {error: _error, token} = await generateToken()
    if (_error)
        return json({error: 'Bir hata meydana geldi. Daha sonra tekrar deneyin'}, {status: 500})

    const __error = await createToken(token, userId)
    if (__error)
        return json({error: 'Bir hata meydana geldi. Daha sonra tekrar deneyin'}, {status: 500})

    setTimeout(() => removeToken(token), 300000)

    const ___error = await sendMail(
        email,
        'Şifrenizi Kurtarın',
        `
            <p>Merhaba, ${_fullName}.</p>
            
            <br>
            
            <p>Personel Takip Sistemi platformunda şifre kurtarma talebiniz alındı.</p>
            <p><a href="${BASE_URL}/şifremi-kurtar?token=${token}">Şifrenizi değiştirmek için tıklayın.</a></p>
            
            <br>
            
            <p>Personel Takip Sistemi, Adıyaman Üniversitesi</p>
        `
    )

    if (___error)
        return json({error: 'Bir hata meydana geldi. Daha sonra tekrar deneyin'}, {status: 500})

    return json({})
}

function generateToken() {
    return new Promise((resolve) => {
            randomBytes(
                32,
                (error, buffer) => {
                    if (error) {
                        resolve({error})

                        return
                    }

                    resolve({token: buffer.toString('hex')})
                }
            )
        }
    )
}
