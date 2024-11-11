import {PAGE_SIZE_WORKS} from "$lib/js/common/constants.common.js";
import {getWorks} from "$lib/js/server/repositories/repository.sqlite.works.server.js";
import {redirect} from "@sveltejs/kit";

export async function load({depends, locals}) {
    depends('app:çalışmalar')

    const params = new URLSearchParams(locals.search),
        limitEnd = PAGE_SIZE_WORKS * (Number(params.get('sayfa')) || 1),
        {error, works} = await getWorks(
            locals.user.id,
            undefined,
            undefined,
            undefined,
            undefined,
            params.get('tarih'),
            0,
            limitEnd,
        )

    if (error && locals.search !== '?bilinmeyen-bir-hata-meydana-geldi')
        throw redirect(307, encodeURI('/?bilinmeyen-bir-hata-meydana-geldi'))

    return {works, noMore: works.length < limitEnd}
}