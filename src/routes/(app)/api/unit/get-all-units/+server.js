import {json} from "@sveltejs/kit";
import {getUnits} from "$lib/js/server/repositories/repository.sqlite.units.server.js";

export async function GET() {
    const {error, units} = await getUnits(undefined, 0, 9999)
    if (error)
        return json({error}, {status: 404})

    return json({units})
}