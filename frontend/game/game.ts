import Conn from "./conn"
import DB from "./db"

export default class Game {

    static startAndGet():Promise<Game> {

        return new Promise<Game>(async (resolve, reject)=>{

            const [conn, db] = await Promise.all([DB.startAndGet(), Conn.startAndGet()])


        })

    }


}
