export function random(len : number){
    let options = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let result=''
    for(let i=0;i<len;i++){
        result += options[Math.floor(Math.random() * len)]
    }
    return result
}