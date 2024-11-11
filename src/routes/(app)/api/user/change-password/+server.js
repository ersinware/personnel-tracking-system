import {json} from "@sveltejs/kit";
import {changePassword} from "$lib/js/server/repositories/repository.sqlite.users.server.js";

export async function PUT({locals, request}) {
    const error = await changePassword(locals.user.id, await request.text())
    if (error)
        return json({error}, {status: 404})

    return json({})
}