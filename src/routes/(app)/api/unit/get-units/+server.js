import {json} from "@sveltejs/kit";
import {getUnits} from "$lib/js/server/repositories/repository.sqlite.units.server.js";
import {PAGE_SIZE_UNITS} from "$lib/js/common/constants.common.js";

export async function GET({locals}) {
    const params = new URLSearchParams(locals.search),
        page = Number(params.get('sayfa')) || 1,
        limitStart = PAGE_SIZE_UNITS * (page - 1),
        limitEnd = PAGE_SIZE_UNITS * page,
        {error, units} = await getUnits(params.get('arama'), limitStart, limitEnd)

    if (error)
        return json({error}, {status: 404})

    return json({units, noMore: units.length < limitEnd - limitStart})
}