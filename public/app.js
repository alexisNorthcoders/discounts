document.getElementById('file-upload-form').addEventListener('submit', (e)=> uploadFile(e));
function uploadFile(event){
    event.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    formData.append('file', file);

    if (file.type !== 'application/json') {
        document.getElementById('upload-message').classList.remove('hidden');
        document.getElementById('upload-message').innerText="File needs to be type .json!"
        console.error('Only JSON files are allowed.');
        return;
    }

    fetch('http://127.0.0.1:8888/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error uploading file.');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('upload-message').innerText="File uploaded successfully!"
        document.getElementById('upload-message').classList.remove('hidden');
        console.log('File uploaded successfully:', data);
        
    })
    .catch(error => {
        console.error('There was a problem with the file upload:', error);
     
    });
}