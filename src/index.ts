var { getOptions } = require('loader-utils');
import * as fs from 'fs';

/**
 * macth transfrom
 * @param startIndex 
 * @param endIndex 
 * @returns 
 */
const macthTransfrom = (startIndex:Array<number>=[],endIndex:Array<number>=[])=>{
    let result:Array<Array<number>> = []
    const getEnd = (val:number,index:number)=>{
      let end = -1;
      startIndex.slice(index+1).some((item,i)=>{
        const isEnd = item > endIndex[i];
        if(isEnd) {
          end = endIndex[i]
        }
        return isEnd 
      })
      return end !== -1 ? end : endIndex[index];
    }
    startIndex.forEach((val,i)=>{
      result.push([val,getEnd(val,i)])
    })
    return result;
}

/**
 * Set Matching Rules
 * @param str 
 * @param key 
 * @param allow 
 * @returns 
 */
function setMatchList(source:string = '',key:string,allow=false,type:'html' | 'js' = 'js') {
    const getRegx = (type:'html' | 'js' = 'js')=>{
      let pattern = type === 'js' ? 
      (new RegExp(`\\/\\/[\\s]{0,}\\#if[\\s]{1,}${key}[\\s\\S]*\\/\\/[\\s]{0,}\\#endif[\\s]{1,}${key}[\\r\\n]{0,1}`,'gim'))
      : (new RegExp(`\\<\\!\\-\\-[\\s]{0,}\\#if[\\s]{1,}${key}[\\s]{0,}\\-\\-\\>[\\s\\S]*\\<\\!\\-\\-[\\s]{0,}\\#endif[\\s]{1,}${key}[\\s]{0,}\\-\\-\\>[\\r\\n]{0,1}`,'gim'))
      let endifPattern = type === 'js' ? 
      (new RegExp(`\\/\\/[\\s]{0,}\\#endif[\\s]{0,1}${key}[\\r\\n]{0,1}`,'gim')) : 
      (new RegExp(`\\<\\!\\-\\-[\\s]{0,}\\#endif[\\s]{1,}${key}[\\s]{0,}\\-\\-\\>[\\r\\n]{0,1}`,'gim'))
      let firstPattern = type === 'js' ? 
      (new RegExp(`\\/\\/[\\s]{0,}\\#if[\\s]{0,1}${key}[\\r\\n]{0,1}`,'gim')) :
      (new RegExp(`\\<\\!\\-\\-[\\s]{0,}\\#if[\\s]{1,}${key}[\\s]{0,}\\-\\-\\>[\\r\\n]{0,1}`,'gim'))
      return {
        pattern,
        endifPattern,
        firstPattern
      }
    }
    const {pattern,endifPattern,firstPattern} = getRegx(type)
    let resultArrs = source.match(pattern);
    if(!resultArrs) return source
    let result:string = resultArrs[0]
    if(allow){
      result = result.replace(firstPattern,'').replace(endifPattern,'')
      return source.replace(pattern,result);
    }
    const endItems = result.matchAll(endifPattern); 
    const firstItems = result.matchAll(firstPattern);
    const endIndex = [...endItems].map(item=>item.index||0)
    const firstIndex = [...firstItems].map(item=>item.index||0)
    const indexs = macthTransfrom(firstIndex,endIndex)
    let removeItems:any[] = []
    indexs.forEach(item=>{
      const start = item[0]
      const end = item[1]
      removeItems.push(result.substr(start,end))
    })
    removeItems.forEach(item=>{
      source = source.replace(item,'')
    })
    return source
  }

interface optionItems  {
    /**
     * config file path (.json)
     */
    configPath?:string
    /**
     * percompile config
     */
    config?:{[key:string]:boolean}
}

const transform = (content:string,options:optionItems)=>{
  const { config, configPath } = options || {}
    if(!config && !configPath) return content
    let precompileConfig = {}
    if(configPath){
        const confStr = fs.readFileSync(configPath,'utf-8')
        try{
            precompileConfig = JSON.parse(confStr)
        }catch(err){
            precompileConfig = {}
        }
    }
    precompileConfig = Object.assign({},precompileConfig,config||{})
    Object.keys(precompileConfig).forEach(key=>{
        const val = precompileConfig[key]
        content = setMatchList(content,key,val) || ''
        content = setMatchList(content,key,val,'html') || ''
    })
    return content
}
export default function (source: string) {
  let options:optionItems = getOptions(this);
  return transform(source,options)
}