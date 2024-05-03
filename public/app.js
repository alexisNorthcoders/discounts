document.getElementById('file-upload-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    formData.append('file', file);

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
        console.log('File uploaded successfully:', data);
        
    })
    .catch(error => {
        console.error('There was a problem with the file upload:', error);
     
    });
});