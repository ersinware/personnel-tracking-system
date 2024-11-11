import {json} from "@sveltejs/kit";
import {checkUserExistenceByEmail} from "$lib/js/server/repositories/repository.sqlite.users.server.js";

export async function PUT({request}) {
    const {error, exists} = await checkUserExistenceByEmail(await request.text())
    if (error)
        return json({error}, {status: 500})

    if (exists)
        return json({error: 'Aynı e-posta adresine sahip başka bir kullanıcı mevcut.'}, {status: 409})

    return json({})
}