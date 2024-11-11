import {json} from "@sveltejs/kit";
import {getUserIdByToken} from "$lib/js/server/repositories/repository.sqlite.recover.password.tokens.server.js";
import {changePassword} from "$lib/js/server/repositories/repository.sqlite.users.server.js";

export async function PUT({url, request}) {
    const token = url.searchParams.get('token')
    if (!token)
        json({error: 'Şifrenizi kurtarmak için gerekli olan bilete sahip değilsiniz.'}, {status: 401})

    const {error, userId} = await getUserIdByToken(token)
    if (error)
        json({error: 'Şifrenizi kurtarma biletiniz geçersiz, linkin süresi dolmuş olabilir. Daha sonra tekrar deneyin.'}, {status: 401})

    const _error = await changePassword(userId, await request.text())
    if (_error)
        json({error: _error}, {status: 401})

    return json({})
}