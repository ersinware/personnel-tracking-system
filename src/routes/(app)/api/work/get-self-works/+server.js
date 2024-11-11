import {PAGE_SIZE_WORKS} from "$lib/js/common/constants.common.js";
import {getWorks} from "$lib/js/server/repositories/repository.sqlite.works.server.js";
import {json} from "@sveltejs/kit";

export async function GET({locals}) {
    const params = new URLSearchParams(locals.search),
        page = Number(params.get('sayfa')) || 1,
        limitStart = PAGE_SIZE_WORKS * (page - 1),
        limitEnd = PAGE_SIZE_WORKS * page

    const {error, works} = await getWorks(
        locals.user.id,
        undefined,
        undefined,
        undefined,
        undefined,
        params.get('tarih'),
        limitStart,
        limitEnd
    )

    if (error)
        return json({error}, {status: 500})

    return json({works, noMore: works.length < limitEnd - limitStart})
}