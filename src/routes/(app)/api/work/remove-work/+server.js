import {json} from "@sveltejs/kit";
import {removeWork} from "$lib/js/server/repositories/repository.sqlite.works.server.js";

export async function DELETE({request}) {
    const error = await removeWork(await request.text())
    if (error)
        return json({error}, {status: 404})

    return json({})
}