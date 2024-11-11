import {json} from "@sveltejs/kit";
import {editWork} from "$lib/js/server/repositories/repository.sqlite.works.server.js";
import {capitalizeFirstLetterOnly} from "$lib/js/common/util.common.js";

export async function PUT({request}) {
    const {id, content} = await request.json(),
        error = await editWork(id, capitalizeFirstLetterOnly(content))

    if (error)
        return json({error}, {status: 409})

    return json({})
}