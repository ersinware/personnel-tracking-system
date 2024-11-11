import {json} from "@sveltejs/kit";
import {capitalizeFirstLetterOnly} from "$lib/js/common/util.common.js";
import {createWork} from "$lib/js/server/repositories/repository.sqlite.works.server.js";

export async function PUT({request, locals}) {
    const error = await createWork(
        locals.user.id,
        locals.user.authorizedUnit.id,
        capitalizeFirstLetterOnly(await request.text())
    )

    if (error)
        return json({error}, {status: 409})

    return json({})
}