import {PAGE_SIZE_USERS} from "$lib/js/common/constants.common.js";
import {redirect} from "@sveltejs/kit";
import {getUsers} from "$lib/js/server/repositories/repository.sqlite.users.server.js";

export async function load({depends, locals}) {
    depends('app:kullanıcılar')

    const params = new URLSearchParams(locals.search),
        limitEnd = PAGE_SIZE_USERS * (Number(params.get('sayfa')) || 1)

    if (locals.user.role === 0) {
        const {error, users} = await getUsers(
            locals.user.id,
            undefined,
            '1, 2',
            params.get('kullanıcı-adı'),
            params.get('birim-adı'),
            0,
            limitEnd
        )

        if (error)
            throw redirect(307, encodeURI('/?bilinmeyen-bir-hata-meydana-geldi'))

        return {users, noMore: users.length < limitEnd}
    }

    const {error, users} = await getUsers(
        locals.user.id,
        locals.user.authorizedUnit.id,
        '2',
        params.get('kullanıcı-adı'),
        undefined,
        0,
        limitEnd
    )

    if (error)
        throw redirect(307, encodeURI('/?bilinmeyen-bir-hata-meydana-geldi'))

    return {users, noMore: users.length < limitEnd}
}