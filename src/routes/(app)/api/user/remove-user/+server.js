import {json} from "@sveltejs/kit";
import {removeUser} from "$lib/js/server/repositories/repository.sqlite.users.server.js";

export async function DELETE({request}) {
    const error = await removeUser(await request.text())
    if (error)
        return json({error}, {status: 404})

    return json({})
}