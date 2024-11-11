import {json} from "@sveltejs/kit";
import {checkEmailAndPasswordMatch} from "$lib/js/server/repositories/repository.sqlite.users.server.js";
import {createUser} from "$lib/js/server/repositories/repository.sqlite.authenticated.users.server.js";

export async function PUT({request, cookies}) {
    const {email, password} = await request.json(),
        {error, match, user} = await checkEmailAndPasswordMatch(email, password)

    if (error)
        return json({error}, {status: 401})

    if (!match)
        return json({error: 'Kullanıcı adı ya da şifreniz hatalı.'}, {status: 401})

    const sessionId = crypto.randomUUID(),
        _error = await createUser(sessionId, user.id, user.role, user.unitId)

    if (_error)
        return json({error: _error}, {status: 500})

    cookies.set(
        "sessionId",
        sessionId,
        {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 34560000
        }
    )

    return json({})
}