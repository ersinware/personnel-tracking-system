import {PAGE_SIZE_WORKS} from "$lib/js/common/constants.common.js";
import {getWorks} from "$lib/js/server/repositories/repository.sqlite.works.server.js";
import {redirect} from "@sveltejs/kit";

export async function load({locals}) {
    const params = new URLSearchParams(locals.search),
        limitEnd = PAGE_SIZE_WORKS * (Number(params.get('sayfa')) || 1)

    if (locals.user.role === 0) {
        const {error, works} = await getWorks(
            undefined,
            locals.user.id,
            undefined,
            params.get('kullanıcı-adı'),
            params.get('birim-adı'),
            params.get('tarih'),
            0,
            limitEnd
        )

        if (error)
            throw redirect(307, encodeURI('/?bilinmeyen-bir-hata-meydana-geldi'))

        return {works, noMore: works.length < limitEnd}
    }

    const {error, works} = await getWorks(
        undefined,
        locals.user.id,
        locals.user.authorizedUnit.id,
        params.get('kullanıcı-adı'),
        undefined,
        params.get('tarih'),
        0,
        limitEnd
    )

    if (error)
        throw redirect(307, encodeURI('/?bilinmeyen-bir-hata-meydana-geldi'))

    return {works, noMore: works.length < limitEnd}
}