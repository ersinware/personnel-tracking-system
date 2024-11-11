import {json} from "@sveltejs/kit";
import {removeUnit} from "$lib/js/server/repositories/repository.sqlite.units.server.js";

export async function DELETE({request}) {
    const error = await removeUnit(await request.text())
    if (error)
        return json({error}, {status: 404})

    return json({})
}