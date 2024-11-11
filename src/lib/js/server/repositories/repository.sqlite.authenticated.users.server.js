import {db} from "$lib/js/server/sqlite.server.js";

export function createAuthenticatedUsersTable() {
    return new Promise((resolve) => {
            db.run(
                `
                    CREATE TABLE IF NOT EXISTS authenticatedUsers (
                        sessionId TEXT NOT NULL PRIMARY KEY, 
                        userId INTEGER NOT NULL, 
                        role INTEGER NOT NULL, 
                        unitId INTEGER NOT NULL, 
                        FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE
                    )
                `,
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

export function createUser(sessionId, userId, role, unitId) {
    return new Promise((resolve) => {
            db.run(
                `   
                    INSERT INTO authenticatedUsers (sessionId, userId, role, unitId) 
                    VALUES (?, ?, ?, ?)
                `,
                [sessionId, userId, role, unitId],
                error => {
                    if (error)
                        resolve(error.message)
                    else
                        resolve()
                }
            )
        }
    )
}

export function removeUser(sessionId) {
    return new Promise((resolve) => {
            db.run(
                `
                    DELETE FROM authenticatedUsers 
                    WHERE sessionId = ?
                `,
                [sessionId],
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

export function isAuthenticated(sessionId) {
    return new Promise((resolve) => {
            db.get(
                `
                    SELECT authenticatedUsers.userId, authenticatedUsers.role, units.id AS unitId FROM authenticatedUsers 
                    JOIN units ON authenticatedUsers.unitId = units.id 
                    WHERE authenticatedUsers.sessionId = ? 
                    LIMIT 1
                `,
                [sessionId],
                (error, row) => {
                    if (error)
                        resolve({error: error.message})
                    else if (!row)
                        resolve({authenticated: false})
                    else
                        resolve({
                                authenticated: true,
                                userId: row.userId,
                                role: row.role,
                                authorizedUnit: {id: row.unitId}
                            }
                        )
                }
            )
        }
    )
}
