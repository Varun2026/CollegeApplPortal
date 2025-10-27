import React from 'react';
import axios from 'axios';


function App() {
const [msg, setMsg] = React.useState('');


React.useEffect(() => {
axios.get('/api/health')
.then(r => setMsg('Backend up'))
.catch(e => setMsg('Backend down'));
}, []);


return (
<div style={{padding:20}}>
<h2>College Application</h2>
<p>{msg}</p>
</div>
);
}


export default App;