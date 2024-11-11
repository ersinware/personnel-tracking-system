import {json} from "@sveltejs/kit";
import {checkIdAndPasswordMatch} from "$lib/js/server/repositories/repository.sqlite.users.server.js";

export async function PUT({locals, request}) {
    const {error, match} = await checkIdAndPasswordMatch(locals.user.id, await request.text())
    if (error)
        return json({error}, {status: 401})

    if (!match)
        return json({error: 'Şifreniz doğrulanamadı.'}, {status: 401})

    return json({})
}