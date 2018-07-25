function sendTest(folderID){
  var table = document.getElementById("table_dropbox")
  //현재 최초0
  if(folderID==''){
    var FolderID='root';
  }
  else var FolderID =folderID;
  var Accesstoken='kFb_ENWtmyUAAAAAAAABXmkgkMo381IwrSZdCoj2voMWz0dRlWPda7Caj0ivnG7X';
  var user_id=3;
  console.log(FolderID);
  var send_url = 'http://localhost:4000/api/dropbox/check/';
    $.ajax({
                  // type: 'post',
                  dataType: 'jsonp',
                  contentType:"application/x-www-form-urlencoded;charset=utf-8", //한글 깨짐 방지
                  data:
                    'user_id='+user_id+'&'+
                    'CP_love='+Accesstoken+'&'+
                    'folderID='+FolderID,
                  jsonp: 'callback',
                  url: send_url,
                  success: function(filelist) {

                      var code =
                      '<tr>'
                          +'<td> </td>'
                          +'<td>번   호</td>'
                          +'<td>파일이름</td>'
                          +'<td>파일형식</td>'
                          +'<td>올린날짜</td>'
                          +'<td>파일용량</td>'
                      '</tr>';
                      var folderList = FolderID.split("*");
                      if(folderList[0]==FolderID){
                        code = code+
                        "<tr data-id=''>"
                           +"<td></td>"
                            +"<td></td>"
                            +'<td><a href="#" onclick ="moveFolder(this)" value="root">/</a></td>'
                            +'<td></td>'
                            +'<td></td>'
                            +'<td></td>'
                        +'</tr>';
                      }
                      else{
                        var beforeFolder='';
                        var beforeFolderName='';
                        for(var i=0; i<folderList.length-1 ; i++){
                          if(i==0){
                            beforeFolder=folderList[i];
                            beforeFolderName=folderList[i];
                          }
                          else{
                            beforeFolder=beforeFolder+"*"+folderList[i];
                            beforeFolderName=beforeFolderName+"/"+folderList[i];
                          }
                        }
                        code = code+
                      "<tr data-id='"+beforeFolder+"'>"
                        + "<td></td>"
                          +"<td></td>"
                          +"<td><a href='#' onclick ='moveFolder(this)' value='"+beforeFolder+"' >"+beforeFolderName+"</a></td>"
                          +"<td></td>"
                          +"<td></td>"
                          +"<td></td>"
                    +"  </tr>";
                      }

                          if(filelist.length>0){
                             for(var i=0; i<filelist.length; i++)
                             {
                                var oneItem = filelist[i];
                                var size = formatBytes(oneItem.size,3);

                                if(oneItem.mimeType=='folder'){
                                  if(FolderID==''){
                                    if(oneItem.name=="%"){
                                      var Foldername = oneItem.name+'25';
                                    }
                                    else var Foldername = oneItem.name;
                                  code = code+
                                  "<tr>"
                                     +"<td><input type='checkbox' name='name' value="+oneItem.name+"*"+oneItem.id+" ></td>"
                                      +"<td>"+i+"</td>"
                                    +"  <!--폴더라면 폴더 ID를 넘겨서 다시 URL을 전송한다.-->"
                                    +  "<td data-id='"+Foldername+"'>"
                                    +    "<a href='#' onclick ='moveFolder(this)' value='"+Foldername+"' >"+oneItem.name+"</a></td>"
                                    +  "<td>"+oneItem.mimeType+"</td>"
                                    +  "<td>"+oneItem.modifiedTime+"</td>"
                                    +  "<td>"+size+"</td>"
                                  +"</tr>";

                                  }
                                  else {
                                    if(oneItem.name=="%"){
                                      var Foldername = oneItem.name+'25';
                                    }
                                    else var Foldername = oneItem.name;
                                    code = code+
                                  "<tr>"
                                  +   "<td><input type='checkbox' name='name' value='"+oneItem.name+"*"+oneItem.id+"' ></td>"
                                  +    "<td>"+i+"</td>"
                                  +    "<td data-id='"+FolderID+"*"+Foldername+"'>"
                                  +      "<a href='#' onclick ='moveFolder(this)' value='"+FolderID+"*"+Foldername+"'>"+oneItem.name+"</a></td>"
                                  +    "<td>"+oneItem.mimeType+"</td>"
                                  +    "<td>"+oneItem.modifiedTime+"</td>"
                                  +    "<td>"+size+"</td>"
                                  +"</tr>";
                                  }
                                }
                                else{
                                  code = code+
                                "<tr>"
                                +   "<td><input type='checkbox' name='name' value='"+oneItem.name+"*"+oneItem.id+"' ></td>"
                                +    "<td>"+i+"</td>"
                                +    "<td>"+oneItem.name+"</td>"
                                +    "<td>"+oneItem.mimeType+"</td>"
                                +    "<td>"+oneItem.modifiedTime+"</td>"
                                +    "<td>"+size+"</td>"
                                +"</tr>";
                              }
                            }
                          }
                      // var code = setEJS(data, '');
                      table.innerHTML=code;
                  }
              });
};
