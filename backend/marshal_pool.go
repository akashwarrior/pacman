package main

import (
	"sync"

	"google.golang.org/protobuf/proto"
)

var wsMarshalBufPool = sync.Pool{
	New: func() any {
		return make([]byte, 0, 512)
	},
}

var wsMarshalOpts proto.MarshalOptions

func marshalToWS(m proto.Message) ([]byte, bool) {
	buf := wsMarshalBufPool.Get().([]byte)
	buf = buf[:0]
	out, err := wsMarshalOpts.MarshalAppend(buf, m)
	if err != nil {
		wsMarshalBufPool.Put(out[:0])
		return nil, false
	}
	return out, true
}

func releaseWSMarshalBuf(b []byte) {
	if b != nil {
		wsMarshalBufPool.Put(b[:0])
	}
}
