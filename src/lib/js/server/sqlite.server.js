import pkg from 'sqlite3';

const {verbose} = pkg

export let db

export async function initSQLite() {
    return new Promise(resolve => {
        const sqlite3 = verbose()

        db = new sqlite3.Database(
            './personel-takip.db',
            (error) => {
                if (error)
                    console.error('\n' + error.message)
                else
                    db.run("PRAGMA foreign_keys = ON")

                resolve()
            })
    })
}

export function convertToSQLiteDate(date) {
    try {
        const [datePart] = date.split(', '),
            [day, month, year] = datePart.split('.')

        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    } catch (error) {
        return undefined
    }
}

export function convertFromSQLiteDate(date) {
    const [datePart, timePart] = date.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');

    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}, ${hour.padStart(2, '0')}.${minute.padStart(2, '0')}`;
}