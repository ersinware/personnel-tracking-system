import {json} from "@sveltejs/kit";
import {capitalizeWords} from "$lib/js/common/util.common.js";
import {createUnit} from "$lib/js/server/repositories/repository.sqlite.units.server.js";

export async function PUT({request}) {
    const {error, unit} = await createUnit(capitalizeWords(await request.text()))
    if (error)
        return json({error}, {status: 409})

    return json({unit})
}