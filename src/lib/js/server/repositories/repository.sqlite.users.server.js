import {db} from "$lib/js/server/sqlite.server.js"

export function createUsersTable() {
    return new Promise((resolve) => {
            db.run(
                `
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        fullName TEXT NOT NULL, 
                        email TEXT UNIQUE NOT NULL, 
                        password TEXT NOT NULL, 
                        role INTEGER NOT NULL, 
                        unitId INTEGER NOT NULL, 
                        FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE
                     )
                `,
                (error) => {
                    if (error)
                        resolve(error.message)
                    else
                        db.run(
                            "CREATE INDEX IF NOT EXISTS idx_users_fullName ON users (fullName)",
                            (error) => {
                                if (error)
                                    resolve(error.message)
                                else
                                    db.run(
                                        "CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)",
                                        (error) => {
                                            if (error)
                                                resolve(error.message)
                                            else
                                                resolve()
                                        }
                                    )
                            }
                        )
                }
            )
        }
    )
}

export function createUser(fullName, email, password, role, unitId) {
    return new Promise((resolve) => {
            db.run(
                `
                    INSERT INTO users (
                            fullName, 
                            email, 
                            password, 
                            role, 
                            unitId
                        ) 
                    VALUES (?, ?, ?, ?, ?)
                `,
                [fullName, email, password, role, unitId],
                async function (error) {
                    if (error)
                        resolve({error: error.message})
                    else {
                        const {error, user} = await getUser(this.lastID)

                        if (error)
                            resolve({error: error.message})
                        else
                            resolve({user})
                    }
                }
            )
        }
    )
}

export function changePassword(id, password) {
    return new Promise((resolve) => {
            db.run(
                `
                    UPDATE users SET password = ? 
                    WHERE id = ?
                `,
                [password, id],
                function (error) {
                    if (error)
                        resolve(error.message)
                    else if (this.changes === 0)
                        resolve('Kullanıcı bulunamadı.')
                    else
                        resolve()
                }
            )
        }
    )
}

export function removeUser(id) {
    return new Promise((resolve) => {
            db.run(
                `
                    DELETE FROM users 
                    WHERE id = ?
                 `,
                [id],
                function (error) {
                    if (error)
                        resolve(error.message)
                    else if (this.changes === 0)
                        resolve('Kullanıcı bulunamadı')
                    else
                        resolve()
                }
            )
        }
    )
}

export function getUser(id) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT users.id, users.fullName, users.email, users.role, units.id AS unitId, units.name AS unitName
                    FROM users
                    JOIN units ON units.id = users.unitId
                    WHERE users.id = ?
                `,
                [id],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({error: "Kullanıcı Bulunamadı."})
                    else
                        resolve({
                                user: {
                                    id: row.id,
                                    fullName: row.fullName,
                                    email: row.email,
                                    role: row.role,
                                    authorizedUnit: {id: row.unitId, name: row.unitName}
                                }
                            }
                        )
                }
            )
        }
    )
}

export function getUsers(notUserId, unitId, roles, searchUserFullName, searchUnitName, limitStart, limitEnd) {
    return new Promise((resolve) => {
            const params = []
            let query = `
                    SELECT users.id, users.fullName, users.email, users.role, units.name AS unitName 
                    FROM users 
                    JOIN units ON users.unitId = units.id 
                    WHERE role IN (${roles})
                        AND users.id != ${notUserId}
                `

            if (unitId) {
                query += ` AND users.unitId = ?`
                params.push(unitId)
            }

            if (searchUserFullName) {
                query += ` AND users.fullName LIKE ?`
                params.push(`%${searchUserFullName}%`)
            }

            if (searchUnitName) {
                query += ` AND units.name LIKE ?`
                params.push(`%${searchUnitName}%`)
            }

            query += ` ORDER BY users.id DESC`

            if (limitStart && limitEnd) {
                query += ` LIMIT ? OFFSET ?`
                params.push(limitEnd - limitStart, limitStart)
            } else if (limitEnd) {
                query += ` LIMIT ?`
                params.push(limitEnd)
            }

            db.all(
                query,
                params,
                (error, rows) => {
                    if (error) {
                        resolve({error: error.message})
                    } else {
                        resolve({
                                users: rows.map(user => ({
                                        id: user.id,
                                        fullName: user.fullName,
                                        email: user.email,
                                        role: user.role,
                                        authorizedUnit: {name: user.unitName}
                                    })
                                )
                            }
                        )
                    }
                }
            )
        }
    )
}

export function checkEmailAndPasswordMatch(email, password) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT id, role, unitId FROM users 
                    WHERE email = ? AND password = ?
                `,
                [email, password],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({match: false})
                    else
                        resolve({match: true, user: row})
                }
            )
        }
    )
}

export function checkIdAndPasswordMatch(id, password) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT 1 FROM users 
                    WHERE id = ? AND password = ?
                `,
                [id, password],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({match: false})
                    else
                        resolve({match: true})
                }
            )
        }
    )
}

export function checkUserExistenceByEmail(email) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT 1 FROM users 
                    WHERE email = ? 
                `,
                [email],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({exists: false})
                    else
                        resolve({exists: true})
                }
            )
        }
    )
}

export function checkFullNameAndEmailMatch(fullName, email) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT id FROM users 
                    WHERE fullName = ? AND email = ?
                `,
                [fullName, email],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({match: false})
                    else
                        resolve({match: true, id: row.id})
                }
            )
        }
    )
}



