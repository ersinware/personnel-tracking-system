import {redirect} from "@sveltejs/kit";
import {getUnits} from "$lib/js/server/repositories/repository.sqlite.units.server.js";
import {PAGE_SIZE_UNITS} from "$lib/js/common/constants.common.js";

export async function load({depends, locals}) {
    depends('app:birimler')

    const params = new URLSearchParams(locals.search),
        limitEnd = PAGE_SIZE_UNITS * (Number(params.get('sayfa')) || 1)

    const {error, units} = await getUnits(params.get('arama'), 0, limitEnd)
    if (error)
        throw redirect(307, encodeURI('/?bilinmeyen-bir-hata-meydana-geldi'))

    return {units, noMore: units.length < limitEnd}
}