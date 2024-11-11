import {json} from "@sveltejs/kit";
import {removeUser} from "$lib/js/server/repositories/repository.sqlite.authenticated.users.server.js";

export async function DELETE({cookies}) {
    const error = await removeUser(cookies.get('sessionId'))
    if (error)
        return json({error}, {status: 404})

    cookies.set("sessionId", '', {path: '/', maxAge: -1})

    return json({})
}