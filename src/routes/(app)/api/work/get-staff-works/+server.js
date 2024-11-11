import {PAGE_SIZE_WORKS} from "$lib/js/common/constants.common.js";
import {getWorks} from "$lib/js/server/repositories/repository.sqlite.works.server.js";
import {json} from "@sveltejs/kit";

export async function GET({locals}) {
    const params = new URLSearchParams(locals.search),
        page = Number(params.get('sayfa')) || 1,
        limitStart = PAGE_SIZE_WORKS * (page - 1),
        limitEnd = PAGE_SIZE_WORKS * page

    if (locals.user.role === 0) {
        const {error, works} = await getWorks(
            undefined,
            locals.user.id,
            undefined,
            params.get('kullanıcı-adı'),
            params.get('birim-adı'),
            params.get('tarih'),
            limitStart,
            limitEnd
        )

        if (error)
            return json({error}, {status: 500})

        return json({works, noMore: works.length < limitEnd - limitStart})
    }

    const {error, works} = await getWorks(
        undefined,
        locals.user.id,
        locals.user.authorizedUnit.id,
        params.get('kullanıcı-adı'),
        undefined,
        params.get('tarih'),
        limitStart,
        limitEnd
    )

    if (error)
        return json({error}, {status: 500})

    return json({works, noMore: works.length < limitEnd - limitStart})
}