import {redirect} from "@sveltejs/kit";
import {checkTokenExistence} from "$lib/js/server/repositories/repository.sqlite.recover.password.tokens.server.js";

export async function load({url}) {
    const token = url.searchParams.get('token')

    if (!token)
        throw redirect(307, encodeURI('/giriş-yap?şifre-kurtarma-bileti-yok'))

    const {error, exists} = await checkTokenExistence(token)
    if (error)
        throw redirect(307, encodeURI('/giriş-yap?bilinmeyen-bir-hata-meydana-geldi'))

    if (!exists)
        throw redirect(307, encodeURI('/giriş-yap?şifre-kurtarma-bileti-geçersiz'))
}