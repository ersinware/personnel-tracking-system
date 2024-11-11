import {json} from "@sveltejs/kit";
import {capitalizeWords} from "$lib/js/common/util.common.js";
import {editUnitName} from "$lib/js/server/repositories/repository.sqlite.units.server.js";

export async function PUT({request}) {
    const {id, name} = await request.json(),
        _name = capitalizeWords(name),
        error = await editUnitName(id, _name)

    if (error)
        return json({error}, {status: 404})

    return json({unit: {id, name: _name}})
}